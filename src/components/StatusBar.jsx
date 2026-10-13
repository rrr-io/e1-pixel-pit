// Bottom strip of the editor window: a one-line hint, or the tools for the selected decoration.
export default function StatusBar({ editor, toast }) {
  if (editor.sel) {
    return (
      <div className="status tools" role="toolbar" aria-label="Selected decoration">
        <button type="button" className="tool" onClick={() => editor.clearAll()}>CLEAR ALL</button>
        <button type="button" className="tool" onClick={() => editor.flip()}>FLIP</button>
        <button type="button" className="tool" onClick={() => editor.toFront()}>FRONT</button>
        <button type="button" className="tool" onClick={() => editor.toBack()}>BACK</button>
        <button type="button" className="tool danger" onClick={() => editor.remove()}>DEL</button>
      </div>
    )
  }
  // No hint strip: the space goes to the certificate. Toasts float over the canvas instead.
  return toast ? <div className="toast" role="status">{toast}</div> : null
}
