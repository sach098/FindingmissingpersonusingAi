// home.js — Photo seedha backend ko bhejo (No face-api.js needed in browser)

// ── File select hone par naam dikhao ─────────────────────────────────────────
document.getElementById('photoUpload')?.addEventListener('change', function () {
  const file = this.files[0]
  if (file) {
    const el = document.getElementById('fileNameDisplay')
    if (el) el.textContent = '📎 ' + file.name
    showResult('', '')
  }
})

// ── AI Check Button ───────────────────────────────────────────────────────────
document.getElementById('aiCheckBtn')?.addEventListener('click', async () => {
  const input = document.getElementById('photoUpload')
  const file  = input?.files[0]

  if (!file) {
    showResult('⚠️ Pehle photo select karo!', 'warning')
    return
  }

  const btn = document.getElementById('aiCheckBtn')
  btn.disabled    = true
  btn.textContent = '⏳ AI check kar raha hai...'
  showResult('🔍 Photo analyze ho rahi hai...', 'info')

  try {
    // Photo FormData mein daal ke backend ko bhejo
    const formData = new FormData()
    formData.append('photo', file)

    const res = await fetch('/api/check-face', {
      method: 'POST',
      body:   formData   // Content-Type mat likho — browser khud set karega
    })

    // Response check karo
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text()
      console.error('Server response (not JSON):', text)
      showResult('❌ Server error — Console (F12) mein dekho', 'error')
      resetBtn()
      return
    }

    const data = await res.json()
    console.log('AI Response:', data)

    // Result dikhao
    if (data.status === 'match') {
      showMatch(data)
    } else if (data.status === 'no-match') {
      showResult(
        '😔 Koi match nahi mila database mein.<br>💡 <a href="/report" style="color:#2563eb;font-weight:600;">Yahan report karo →</a>',
        'notfound'
      )
    } else if (data.message === 'Face not detected') {
      showResult(
        '❌ Photo mein face detect nahi hua.<br>💡 Saaf aur seedhi photo use karo jisme chehra clearly dikh raha ho.',
        'error'
      )
    } else {
      showResult('❌ ' + (data.message || 'Kuch error aaya'), 'error')
    }

  } catch (err) {
    console.error('Fetch error:', err)
    showResult('❌ Network error: ' + err.message, 'error')
  }

  resetBtn()
})

// ── Match card dikhao ─────────────────────────────────────────────────────────
function showMatch(data) {
  const photoHtml = data.image
    ? `<img src="/uploads/${data.image}" style="width:100%;height:200px;object-fit:cover;border-radius:10px;margin-bottom:12px;">`
    : `<div style="height:200px;background:#f3f4f6;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:50px;margin-bottom:12px;">👤</div>`

  const confidence = parseFloat(data.accuracy)
  const barColor   = confidence > 70 ? '#22c55e' : confidence > 40 ? '#f59e0b' : '#ef4444'

  showResult(`
    <div style="text-align:center;">
      <div style="font-size:18px;font-weight:700;color:#15803d;margin-bottom:16px;">
        🎯 Match Mila!
      </div>
      <div style="max-width:280px;margin:0 auto;background:white;border-radius:12px;
        padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.1);border:2px solid #22c55e;">
        ${photoHtml}
        <h3 style="margin:0 0 8px;font-size:20px;">${data.name}</h3>
        ${data.age    ? `<p style="color:#6b7280;margin:2px 0;">Age: ${data.age}</p>`    : ''}
        ${data.gender ? `<p style="color:#6b7280;margin:2px 0;">${data.gender}</p>`      : ''}
        ${data.city   ? `<p style="color:#6b7280;margin:2px 0;">📍 ${data.city}</p>`     : ''}

        <!-- Confidence bar -->
        <div style="margin-top:14px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:4px;">
            <span>AI Confidence</span>
            <span style="font-weight:700;color:${barColor};">${data.accuracy}%</span>
          </div>
          <div style="height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${data.accuracy}%;background:${barColor};border-radius:99px;transition:width .6s ease;"></div>
          </div>
        </div>

        ${data._id
          ? `<a href="/person/${data._id}" style="display:block;margin-top:14px;padding:10px;
              background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:600;">
              View Full Details →
            </a>`
          : ''}
      </div>
    </div>`, 'success')
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showResult(html, type) {
  const el = document.getElementById('aiResult')
  if (!el) return
  const styles = {
    success:  'background:#f0fdf4;border:1.5px solid #86efac;color:#15803d;',
    error:    'background:#fef2f2;border:1.5px solid #fca5a5;color:#dc2626;',
    warning:  'background:#fefce8;border:1.5px solid #fde047;color:#854d0e;',
    info:     'background:#eff6ff;border:1.5px solid #93c5fd;color:#1d4ed8;',
    notfound: 'background:#f5f3ff;border:1.5px solid #c4b5fd;color:#6d28d9;',
  }
  if (!html) { el.style.display = 'none'; return }
  el.style.cssText = `display:block;padding:20px;border-radius:12px;font-size:15px;margin-top:16px;${styles[type] || styles.info}`
  el.innerHTML = html
}

function resetBtn() {
  const btn = document.getElementById('aiCheckBtn')
  if (btn) { btn.disabled = false; btn.textContent = '✨ Check with AI' }
}
