import httpx
from typing import List, Optional, Dict, Any
import json

from config import get_settings
from models import Profile

settings = get_settings()

class UniversityService:
    def __init__(self):
        self.hipolabs_url = settings.hipolabs_api_url
        self.groq_api_key = settings.groq_api_key
        self.groq_client = None
        
        if self.groq_api_key:
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=self.groq_api_key)
            except Exception as e:
                print(f"Failed to initialize Groq for university service: {e}")
    
    async def fetch_universities(self, country: str) -> List[Dict[str, Any]]:
        """Fetch universities from HiPolabs API"""
        # Large countries have too many results causing API issues
        # Use name filter to reduce response size
        large_countries = ["United States", "United Kingdom"]
        
        params = {"country": country}
        if country in large_countries:
            # Add name filter to reduce results for large countries
            params["name"] = "university"
        
        max_retries = 2
        
        for attempt in range(max_retries):
            try:
                timeout = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0)
                
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(self.hipolabs_url, params=params)
                    response.raise_for_status()
                    universities = response.json()
                    
                    if universities:
                        # Filter out excluded universities
                        excluded_names = [
                            "Indiana University/Purdue University at Columbus",
                            "Indiana University-Purdue University Columbus",
                            "Indiana University/Purdue University at Indianapolis",
                            "Indiana University-Purdue University Indianapolis",
                            "Indiana University/Purdue University at Fort Wayne",
                            "Indiana University-Purdue University Fort Wayne"
                        ]
                        filtered_universities = [
                            u for u in universities 
                            if u.get("name") not in excluded_names and "Purdue University" not in u.get("name", "")
                        ]
                        return filtered_universities[:50]  # Limit to 50 results
                    
                    # If name filter returned nothing, try without it
                    if "name" in params:
                        del params["name"]
                        response = await client.get(self.hipolabs_url, params=params)
                        response.raise_for_status()
                        universities = response.json()
                        
                        # Filter out excluded universities for fallback too
                        excluded_names = [
                            "Indiana University/Purdue University at Columbus",
                            "Indiana University-Purdue University Columbus",
                            "Indiana University/Purdue University at Indianapolis",
                            "Indiana University-Purdue University Indianapolis",
                            "Indiana University/Purdue University at Fort Wayne",
                            "Indiana University-Purdue University Fort Wayne"
                        ]
                        filtered_universities = [
                            u for u in universities 
                            if u.get("name") not in excluded_names and "Purdue University" not in u.get("name", "")
                        ]
                        return filtered_universities[:50]
                        
            except Exception as e:
                print(f"Attempt {attempt + 1} failed for {country}: {e}")
                if attempt == max_retries - 1:
                    # Final fallback for large countries
                    if country in large_countries:
                        return await self._fetch_with_name_filters(country)
                    return []
                import asyncio
                await asyncio.sleep(0.5)
        
        return []
    
    async def _fetch_with_name_filters(self, country: str) -> List[Dict[str, Any]]:
        """Fetch universities using multiple name filters to get variety"""
        all_universities = []
        name_filters = ["university", "college", "institute", "school"]
        
        try:
            timeout = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=10.0)
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                for name_filter in name_filters:
                    if len(all_universities) >= 50:
                        break
                    
                    try:
                        response = await client.get(
                            self.hipolabs_url,
                            params={"country": country, "name": name_filter}
                        )
                        if response.status_code == 200:
                            universities = response.json()
                            # Add unique universities
                            existing_names = {u.get("name") for u in all_universities}
                            for uni in universities:
                                if uni.get("name") not in existing_names:
                                    all_universities.append(uni)
                                    existing_names.add(uni.get("name"))
                                if len(all_universities) >= 50:
                                    break
                    except Exception as e:
                        print(f"Filter '{name_filter}' failed for {country}: {e}")
                        continue
            
            return all_universities[:50]
        except Exception as e:
            print(f"Multi-filter fetch failed for {country}: {e}")
            return []
            return []
    
    async def search_and_enrich(
        self,
        country: str,
        profile: Optional[Profile] = None
    ) -> List[Dict[str, Any]]:
        """Search universities and enrich with AI-generated data"""
        # Fetch from HiPolabs
        universities = await self.fetch_universities(country)
        
        if not universities:
            return []
        
        # Enrich with AI if API key is available
        if self.groq_client and profile:
            enriched = await self._enrich_with_ai(universities, profile)
            return enriched
        else:
            # Return with mock enrichment if no API key
            return self._mock_enrichment(universities, profile)
    
    async def _enrich_with_ai(
        self,
        universities: List[Dict[str, Any]],
        profile: Profile
    ) -> List[Dict[str, Any]]:
        """Use Groq Llama to enrich university data"""
        try:
            # Prepare profile summary
            profile_summary = f"""
            Student Profile:
            - Education: {profile.degree} in {profile.major}
            - GPA: {profile.gpa}
            - Target Degree: {profile.intended_degree} in {profile.field_of_study}
            - Budget: ${profile.budget_min} - ${profile.budget_max} per year
            - IELTS: {profile.ielts_status} (Score: {profile.ielts_score})
            - GRE: {profile.gre_status} (Score: {profile.gre_score})
            """
            
            # Batch universities for efficiency
            uni_names = [u.get("name", "") for u in universities[:15]]
            
            prompt = f"""
            You are an expert study abroad counselor. Based on the student profile below, 
            analyze these universities and provide enriched data for each.
            
            {profile_summary}
            
            Universities to analyze:
            {json.dumps(uni_names, indent=2)}
            
            For each university, provide a JSON array with:
            1. name: university name
            2. estimated_tuition_min: estimated annual tuition in USD (integer)
            3. estimated_tuition_max: estimated annual tuition in USD (integer)
            4. acceptance_rate: "Low" (< 30%), "Medium" (30-60%), or "High" (> 60%)
            5. match_type: "Dream" (challenging), "Target" (good fit), or "Safe" (likely admission)
            6. match_score: 0-100 score based on profile fit
            7. risk_level: "Low", "Medium", or "High"
            8. why_fits: brief explanation of fit (1 sentence)
            9. risks: potential risks or challenges (1 sentence)
            
            Return ONLY a valid JSON array, no other text.
            """
            
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2048
            )
            
            response_text = response.choices[0].message.content
            
            try:
                # Parse AI response
                enriched_data = json.loads(response_text)
                
                # Merge enriched data with university info
                result = []
                for uni in universities[:15]:
                    uni_name = uni.get("name", "")
                    enrichment = next(
                        (e for e in enriched_data if e.get("name", "").lower() == uni_name.lower()),
                        self._get_default_enrichment(uni_name)
                    )
                    
                    result.append({
                        "name": uni.get("name"),
                        "country": uni.get("country"),
                        "alpha_two_code": uni.get("alpha_two_code"),
                        "web_pages": uni.get("web_pages", []),
                        "domains": uni.get("domains", []),
                        "enriched_data": enrichment
                    })
                
                return result
            except json.JSONDecodeError:
                # Fall back to mock if AI response is invalid
                return self._mock_enrichment(universities, profile)
                
        except Exception as e:
            print(f"AI enrichment error: {e}")
            return self._mock_enrichment(universities, profile)
    
    def _mock_enrichment(
        self,
        universities: List[Dict[str, Any]],
        profile: Optional[Profile]
    ) -> List[Dict[str, Any]]:
        """Provide mock enrichment data when AI is unavailable"""
        result = []
        
        for i, uni in enumerate(universities[:20]):
            # Assign match types based on position
            if i < 3:
                match_type = "Dream"
                acceptance = "Low"
                match_score = 60 + (i * 5)
            elif i < 10:
                match_type = "Target"
                acceptance = "Medium"
                match_score = 70 + (i % 5) * 3
            else:
                match_type = "Safe"
                acceptance = "High"
                match_score = 80 + (i % 5) * 2
            
            # Mock tuition based on country
            country = uni.get("country", "").lower()
            if "united states" in country:
                tuition_min, tuition_max = 35000, 65000
            elif "united kingdom" in country:
                tuition_min, tuition_max = 20000, 45000
            elif "canada" in country:
                tuition_min, tuition_max = 15000, 35000
            elif "australia" in country:
                tuition_min, tuition_max = 20000, 40000
            elif "germany" in country:
                tuition_min, tuition_max = 500, 15000
            else:
                tuition_min, tuition_max = 10000, 30000
            
            result.append({
                "name": uni.get("name"),
                "country": uni.get("country"),
                "alpha_two_code": uni.get("alpha_two_code"),
                "web_pages": uni.get("web_pages", []),
                "domains": uni.get("domains", []),
                "enriched_data": {
                    "estimated_tuition_min": tuition_min,
                    "estimated_tuition_max": tuition_max,
                    "acceptance_rate": acceptance,
                    "match_type": match_type,
                    "match_score": match_score,
                    "risk_level": "Low" if match_type == "Safe" else ("High" if match_type == "Dream" else "Medium"),
                    "why_fits": f"Based on your profile, {uni.get('name')} is a {match_type.lower()} school for you.",
                    "risks": f"Application requires careful preparation." if match_type == "Dream" else "Standard preparation recommended."
                }
            })
        
        return result
    
    def _get_default_enrichment(self, uni_name: str) -> Dict[str, Any]:
        """Get default enrichment for a university"""
        return {
            "name": uni_name,
            "estimated_tuition_min": 20000,
            "estimated_tuition_max": 40000,
            "acceptance_rate": "Medium",
            "match_type": "Target",
            "match_score": 70,
            "risk_level": "Medium",
            "why_fits": "This university aligns with your academic background.",
            "risks": "Consider application requirements carefully."
        }
