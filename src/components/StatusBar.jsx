// Bottom strip of the editor window: a one-line hint, or the tools for the selected decoration.
export default function StatusBar({ editor, toast, onDuplicate }) {
  if (editor.sel) {
    return (
      <div className="status tools" role="toolbar" aria-label="Selected decoration">
        <button type="button" className="tool" onClick={onDuplicate}>COPY</button>
        <button type="button" className="tool" onClick={() => editor.flip()}>FLIP</button>
        <button type="button" className="tool" onClick={() => editor.toFront()}>FRONT</button>
        <button type="button" className="tool" onClick={() => editor.toBack()}>BACK</button>
        <button type="button" className="tool danger" onClick={() => editor.remove()}>DEL</button>
      </div>
    )
  }
  const hint = toast || (editor.isDemo
    ? 'Sample loaded · open your screenshot to start'
    : 'Tap a part to edit it · drag · pinch to size and spin')
  return <div className="status" role="status">{hint}</div>
}
