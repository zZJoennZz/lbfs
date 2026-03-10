class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add CORS headers to every response
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken, Authorization"
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = self.get_response(request)
            response.status_code = 200
            
        return response