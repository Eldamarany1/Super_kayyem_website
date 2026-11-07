using System.ComponentModel.DataAnnotations;

namespace SuperKayyem.ViewModels
{
    public class AdminLoginViewModel
    {
        [Required(ErrorMessage = "يرجى إدخال البريد الإلكتروني")]
        [EmailAddress(ErrorMessage = "بريد إلكتروني غير صالح")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "يرجى إدخال كلمة المرور")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }

    public class JoinTeamViewModel
    {
        [Required(ErrorMessage = "يرجى إدخال الاسم الكامل")]
        [StringLength(80, MinimumLength = 3, ErrorMessage = "الاسم يجب أن يكون بين 3 و 80 حرفاً")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "يرجى إدخال البريد الإلكتروني")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "يرجى إدخال كلمة المرور")]
        [MinLength(6, ErrorMessage = "كلمة المرور يجب ألا تقل عن 6 أحرف")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "يرجى تأكيد كلمة المرور")]
        [Compare("Password", ErrorMessage = "كلمة المرور وتأكيدها غير متطابقين")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class AdminProfileViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "يرجى إدخال الاسم الكامل")]
        [StringLength(80, MinimumLength = 3, ErrorMessage = "الاسم يجب أن يكون بين 3 و 80 حرفاً")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "يرجى إدخال البريد الإلكتروني")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        public string? Password { get; set; }
    }
}
