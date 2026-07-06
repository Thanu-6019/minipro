import os
import json
import tempfile
import requests
from pathlib import Path
from typing import Dict, Any
import asyncio
from urllib.parse import urlparse
class OpenOCRClient:
    """Production OpenOCR API client with proper error handling and retries."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openocr.org"
        self.timeout = 30
        
    async def extract_text(self, image_path: str) -> Dict[str, Any]:
        """Extract text from image using OpenOCR API."""
        url = f"{self.base_url}/v1/ocr"
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Prepare request body
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
        
        payload = {
            "engine": "openocr/tesseract",
            "input": {
                "type": "file",
                "file": image_data.hex(),  # Encode image as hex
                "filename": os.path.basename(image_path),
                "content-type": "image/jpeg"
            },
            "lang": ["eng"],
            "mode": "sync",
            "output_format": "json",
            "confidence_threshold": 0.5
        }
        
        async def make_request():
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: requests.post(url, json=payload, headers=headers, timeout=self.timeout)
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "text": result.get("extracted_text", ""),
                    "confidence": result.get("confidence", 0.0),
                    "success": True,
                    "engine": result.get("engine", "unknown"),
                    "language": result.get("language", "eng"),
                    "processing_time": result.get("processing_time", 0)
                }
            elif response.status_code == 429:
                raise Exception("Rate limit exceeded. Please try again later.")
            elif response.status_code == 401:
                raise Exception("Invalid API key. Please check your OpenOCR credentials.")
            elif response.status_code == 400:
                raise Exception("Invalid request format or image format not supported.")
            else:
                raise Exception(f"OpenOCR API error: {response.status_code} - {response.text}")
        
        # Implement retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                return await make_request()
            except Exception as e:
                if attempt == max_retries - 1:
                    return {
                        "text": "",
                        "confidence": 0.0,
                        "success": False,
                        "error": str(e),
                        "attempt": attempt + 1,
                        "max_retries": max_retries
                    }
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

class OCRProcessor:
    """Production OCR processor with Supabase integration and comprehensive error handling."""
    
    def __init__(self, openocr_api_key: str = None):
        self.temp_dir = Path(tempfile.gettempdir()) / "ocr_temp"
        self.temp_dir.mkdir(exist_ok=True)
        self.openocr_api = OpenOCRClient(openocr_api_key) if openocr_api_key else None
        
    def _download_image(self, image_url: str) -> str:
        """Download image from URL."""
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        image_path = self.temp_dir / "downloaded_image.jpg"
        with open(image_path, "wb") as f:
            f.write(response.content)
            
        return str(image_path)
    
    def _validate_image(self, image_path: str) -> bool:
        """Validate if the file is a valid image."""
        try:
            Image = None
            with Image.open(image_path) as img:
                img.verify()
            return True
        except Exception:
            return False
    
    async def process_image(self, image_input: str) -> Dict[str, Any]:
        """Process image input with production-grade OCR."""
        try:
            if not image_input:
                return {
                    "text": "",
                    "confidence": 0.0,
                    "success": False,
                    "error": "No image input provided"
                }
            
            # Check if input is a URL
            if image_input.startswith(('http://', 'https://')):
                # Download image to local file
                image_path = self._download_image(image_input)
            else:
                # Use provided path directly
                image_path = image_input
            
            # Validate image before processing
            if not self._validate_image(image_path):
                if os.path.exists(image_path) and image_input.startswith(('http://', 'https://')):
                    os.remove(image_path)
                return {
                    "text": "",
                    "confidence": 0.0,
                    "success": False,
                    "error": "Invalid or corrupted image file"
                }
            
            # Process with OpenOCR if available
            if self.openocr_api:
                result = await self.openocr_api.extract_text(image_path)
                
                # Clean up downloaded image
                if image_input.startswith(('http://', 'https://')):
                    downloaded_path = self.temp_dir / "downloaded_image.jpg"
                    if os.path.exists(downloaded_path):
                        os.remove(downloaded_path)
                
                return result
            else:
                return {
                    "text": "",
                    "confidence": 0.0,
                    "success": False,
                    "error": "OpenOCR API key not configured"
                }
                
        except requests.RequestException as e:
            return {
                "text": "",
                "confidence": 0.0,
                "success": False,
                "error": f"Network error: {str(e)}",
                "retry_recommended": True
            }
        except Exception as e:
            return {
                "text": "",
                "confidence": 0.0,
                "success": False,
                "error": str(e),
                "retry_recommended": False
            }

async def process_ocr_image(image_input: str, openocr_api_key: str = None) -> Dict[str, Any]:
    """Main entry point for OCR processing."""
    processor = OCRProcessor(openocr_api_key)
    return await processor.process_image(image_input)

def format_ocr_response(raw_result: Dict[str, Any]) -> Dict[str, Any]:
    """Format OCR response for frontend consumption."""
    if raw_result.get("success"):
        return {
            "text": raw_result.get("text", ""),
            "confidence": raw_result.get("confidence", 0.0),
            "success": True,
            "engine": raw_result.get("engine", "unknown"),
            "language": raw_result.get("language", "eng"),
            "processing_time": raw_result.get("processing_time", 0),
            "requires_manual_review": raw_result.get("confidence", 0.0) < 0.7
        }
    else:
        return {
            "text": "",
            "confidence": 0.0,
            "success": False,
            "error": raw_result.get("error", "Unknown error"),
            "retry_recommended": raw_result.get("retry_recommended", False)
        }

if __name__ == "__main__":
    import sys
    import asyncio
    import os
    
    async def main():
        # Get environment variables
        openocr_api_key = os.getenv('OPENOCR_API_KEY')
        
        if len(sys.argv) < 2:
            result = {
                "error": "No image input provided",
                "usage": "python ocr_processor.py <image_url_or_path>"
            }
            print(json.dumps(result))
            return
            
        image_input = sys.argv[1]
        result = await process_ocr_image(image_input, openocr_api_key)
        
        # Format response for API compatibility
        formatted_result = format_ocr_response(result)
        print(json.dumps(formatted_result, indent=2))
    
    asyncio.run(main())
