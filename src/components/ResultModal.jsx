import { useEffect, useMemo, useState } from 'react'

const FILENAME = 'e1-mama-certificate.png'

export default function ResultModal({ blob, isDemo, size, onClose }) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob])
  const [status, setStatus] = useState(isDemo ? 'This is the sample. Open your screenshot to decorate your real certificate.' : '')
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const file = useMemo(() => new File([blob], FILENAME, { type: 'image/png' }), [blob])
  // Inside a claude.ai artifact the page cannot start downloads or open the share sheet itself:
  // it asks the host through the `downloads` capability instead.
  const inArtifact = typeof window !== 'undefined' && !!window.claude?.use
  const canShare = !inArtifact && typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })

  const download = async () => {
    if (inArtifact) {
      try {
        const dl = await window.claude.use('downloads')
        if (!dl) { setStatus('Download is not available here. Long-press the image to save it.'); return }
        await dl.save({ filename: FILENAME, data: blob })
        setStatus('Saved. See you on the podium!')
      } catch (e) {
        setStatus(e?.code === 'declined' ? 'Download cancelled.' : 'Download is not available here. Long-press the image to save it.')
      }
      return
    }
    const a = document.createElement('a')
    a.href = url; a.download = FILENAME
    document.body.appendChild(a); a.click(); a.remove()
    setStatus('Saved. See you on the podium!')
  }

  // On phones the share sheet is the way to "Save to Photos".
  const share = async () => {
    try { await navigator.share({ files: [file] }); setStatus('Sent. See you on the podium!') }
    catch (e) { if (e?.name !== 'AbortError') setStatus('Sharing failed. Long-press the image to save it.') }
  }

  return (
    <div className="finish" role="dialog" aria-modal="true" aria-labelledby="mTitle">
      <div className="finish-in">
        <section className="win">
          <div className="win-bar red">
            <span className="win-title">FINISH_LINE.PNG</span>
            <button type="button" className="close" onClick={onClose} aria-label="Back to editing">×</button>
          </div>
          <div className="finish-body">
            <h2 id="mTitle">CHECKERED FLAG!<br /><span>CERTIFICATE READY</span></h2>
            <img src={url} alt="Your decorated certificate" />
            <p>{size ? `${size.w}×${size.h} px, same as your screenshot · ` : ''}You can also long-press the image to save it.</p>
            <p className="status-line" role="status">{status}</p>
          </div>
        </section>
        <div className="finish-actions">
          {canShare && <button type="button" className="btn red" onClick={share}>SAVE TO PHOTOS</button>}
          <div className="row">
            <button type="button" className={'btn' + (canShare ? '' : ' red')} onClick={download}>DOWNLOAD</button>
            <button type="button" className="btn" onClick={onClose}>KEEP EDITING</button>
          </div>
        </div>
      </div>
    </div>
  )
}
