using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace SuperKayyem.Models
{
    [Collection("admin_users")]
    public class AdminUser
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "الاسم الكامل مطلوب")]
        [Display(Name = "الاسم الكامل")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        [Display(Name = "البريد الإلكتروني")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [Display(Name = "كلمة المرور")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// "SuperAdmin" (Admin Leader) or "Admin" (Team Member)
        /// </summary>
        public string Role { get; set; } = "Admin";

        /// <summary>
        /// "Pending", "Approved", "Rejected", or "Revoked"
        /// </summary>
        public string Status { get; set; } = "Pending";

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }
    }
}
