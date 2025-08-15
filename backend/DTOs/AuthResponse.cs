using System;

namespace ProjectCollaborationPortal.DTOs
{
    public class AuthResponse
    {
        public string Token { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public DateTime ExpiresAtUtc { get; set; }
    }
}
