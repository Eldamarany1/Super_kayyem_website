import React, { useState } from 'react'
import api from '../../utils/api.js'

// Add Story Page Component - Admin form to create new stories
function AddStoryPage({ setCurrentPage }) {
  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('التعاون')
  const [cover, setCover] = useState(null)
  const [pages, setPages] = useState([{ page_number: 1, content: '' }])

  // Add new page field
  const addPageField = () => {
    setPages([...pages, { page_number: pages.length + 1, content: '' }])
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Use FormData to send image and text together
    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)
    if (cover) formData.append('cover', cover)

    // Convert pages to JSON format for the server
    formData.append('pages_json', JSON.stringify(pages))

    try {
      await api.post('stories/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('تمت إضافة القصة بنجاح!')
      setCurrentPage('library')
    } catch (error) {
      console.error("خطأ في الإضافة:", error)
    }
  }

  return (
    <div className="container story-details-page" dir="rtl">
      <h2>إضافة قصة جديدة ✍️</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Story Title */}
        <input
          type="text"
          placeholder="عنوان القصة"
          onChange={e => setTitle(e.target.value)}
          required
        />

        {/* Category Selection */}
        <select onChange={e => setCategory(e.target.value)}>
          <option value="التعاون">التعاون</option>
          <option value="الصداقة">الصداقة</option>
          <option value="الشجاعة">الشجاعة</option>
        </select>

        {/* Cover Image Upload */}
        <label>غلاف القصة:</label>
        <input type="file" onChange={e => setCover(e.target.files[0])} />

        <hr />
        <h3>محتوى الصفحات</h3>

        {/* Dynamic Page Content Fields */}
        {pages.map((page, index) => (
          <div key={index} className="page-input-group">
            <h4>صفحة {page.page_number}</h4>
            <textarea
              rows="4"
              onChange={e => {
                const newPages = [...pages]
                newPages[index].content = e.target.value
                setPages(newPages)
              }}
              required
            ></textarea>
          </div>
        ))}

        <button type="button" className="btn btn-outline" onClick={addPageField}>
          + إضافة صفحة أخرى
        </button>

        <button type="submit" className="btn btn-primary btn-publish">
          نشر القصة الآن
        </button>
      </form>
    </div>
  )
}

export default AddStoryPage