from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


class AIGenerationThrottle(ScopedRateThrottle):
    scope = 'ai_generation'