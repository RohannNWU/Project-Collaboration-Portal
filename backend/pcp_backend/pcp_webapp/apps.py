from django.apps import AppConfig


class PcpWebappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = "pcp_webapp"

    def ready(self):
        # This imports and connects the signals
        print("Loading signals for pcp_webapp")
        import pcp_webapp.signals