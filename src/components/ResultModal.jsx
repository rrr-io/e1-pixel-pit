import { useEffect, useMemo, useState } from 'react'

const FILENAME = 'e1-mama-certificate.png'

export default function ResultModal({ blob, isDemo, onClose }) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob])
  const [status, setStatus] = useState(isDemo ? 'This is the sample. Insert coin to decorate your real certificate.' : '')
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
    <div className="modal" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <h2 id="mTitle">CHECKERED FLAG!<br />CERTIFICATE READY</h2>
        <img src={url} alt="Your decorated certificate" />
        <p>You can also long-press the image to save it.</p>
        <p className="status" role="status">{status}</p>
        <div className={'row' + (canShare ? ' three' : '')}>
          {canShare && <button type="button" className="coin save" onClick={share}>SAVE TO PHOTOS</button>}
          <button type="button" className={'coin ' + (canShare ? 'up' : 'save')} onClick={download}>DOWNLOAD</button>
          <button type="button" className="coin gacha" onClick={onClose}>BACK TO PIT</button>
        </div>
      </div>
    </div>
  )
}
