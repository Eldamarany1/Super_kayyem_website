using MongoDB.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace SuperKayyem.Models
{
    [Collection("articles")]
    public class Article
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "يجب إدخال عنوان المقال")]
        [Display(Name = "عنوان المقال")]
        public string Title { get; set; } = string.Empty;

        [Display(Name = "التصنيف التربوي")]
        public string Category { get; set; } = "التربية الإيجابية";

        [Display(Name = "صورة المقال التوضيحية")]
        public string ImageUrl { get; set; } = string.Empty;

        [Required(ErrorMessage = "يجب إدخال مقدمة المقال")]
        [Display(Name = "مقدمة المقال")]
        public string Introduction { get; set; } = string.Empty;

        [Required(ErrorMessage = "يجب إدخال موضوع المقال")]
        [Display(Name = "موضوع المقال")]
        public string BodyContent { get; set; } = string.Empty;

        [Required(ErrorMessage = "يجب إدخال خاتمة المقال")]
        [Display(Name = "خاتمة المقال")]
        public string Conclusion { get; set; } = string.Empty;

        [Display(Name = "اسم الناشر")]
        public string AuthorName { get; set; } = string.Empty;

        [Display(Name = "بريد الناشر")]
        public string AuthorEmail { get; set; } = string.Empty;

        [Display(Name = "تاريخ النشر")]
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    }
}
