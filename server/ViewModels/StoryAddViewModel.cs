using SuperKayyem.Models;

namespace SuperKayyem.ViewModels
{
	public class StoryAddViewModel
	{
		// بيانات القصة العادية (العنوان، الوصف، إلخ)
		public Story Story { get; set; } = new();

		// خانة استقبال ملف الصورة المرفوع
		public IFormFile? ImageFile { get; set; }

		// خانة استقبال ملف الـ PDF المرفوع (اختياري)
		public IFormFile? PdfFile { get; set; }
	}
}