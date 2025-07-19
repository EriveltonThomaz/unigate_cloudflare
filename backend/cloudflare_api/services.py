import requests

CLOUDFLARE_API_BASE_URL = "https://api.cloudflare.com/client/v4/"

class CloudflareAPIError(Exception):
    pass

class CloudflareService:
    def __init__(self, api_key, email):
        self.api_key = api_key
        self.email = email

    def _make_request(self, method, endpoint, data=None):
        headers = {
            "X-Auth-Email": self.email,
            "X-Auth-Key": self.api_key,
            "Content-Type": "application/json",
        }
        url = f"{CLOUDFLARE_API_BASE_URL}{endpoint}"

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=data)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, json=data)
            else:
                raise ValueError("Método HTTP não suportado.")

            response.raise_for_status()
            result = response.json()

            if not result["success"]:
                errors = "; ".join([err["message"] for err in result["errors"]])
                raise CloudflareAPIError(f"Erro da API Cloudflare: {errors}")

            return result["result"]

        except requests.exceptions.HTTPError as e:
            try:
                error_response = e.response.json()
                errors = "; ".join([err["message"] for err in error_response["errors"]])
                raise CloudflareAPIError(f"Erro da API Cloudflare (HTTP {e.response.status_code}): {errors}") from e
            except (ValueError, requests.exceptions.JSONDecodeError):
                raise CloudflareAPIError(f"Erro da API Cloudflare (HTTP {e.response.status_code}): {e.response.text}") from e
        except requests.exceptions.ConnectionError as e:
            raise CloudflareAPIError(f"Erro de conexão com a API Cloudflare: {e}") from e
        except requests.exceptions.Timeout as e:
            raise CloudflareAPIError(f"Tempo limite excedido ao conectar com a API Cloudflare: {e}") from e
        except Exception as e:
            raise CloudflareAPIError(f"Erro inesperado ao chamar a API Cloudflare: {e}") from e

    def get_zones(self):
        return self._make_request("GET", "zones")

    def get_dns_records(self, zone_id):
        return self._make_request("GET", f"zones/{zone_id}/dns_records")

    def create_dns_record(self, zone_id, record_data):
        return self._make_request("POST", f"zones/{zone_id}/dns_records", data=record_data)

    def delete_dns_record(self, zone_id, record_id):
        return self._make_request("DELETE", f"zones/{zone_id}/dns_records/{record_id}")

    def update_dns_record(self, zone_id, record_id, record_data):
        return self._make_request("PUT", f"zones/{zone_id}/dns_records/{record_id}", data=record_data)

    def get_a_aaaa_records(self, zone_id):
        all_records = self.get_dns_records(zone_id)
        return [record for record in all_records if record['type'] in ['A', 'AAAA']]