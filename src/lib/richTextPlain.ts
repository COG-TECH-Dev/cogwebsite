type Node = { type?: string; text?: string; children?: Node[] }

/**
 * The first few words of a rich-text field as plain text, for a short summary
 * on a list card. Returns '' when the field is empty.
 */
export function richTextToPlain(data: unknown, max = 140): string {
  const root = (data as { root?: Node } | null | undefined)?.root
  if (!root) return ''
  const parts: string[] = []
  const walk = (node: Node) => {
    if (node.type === 'text' && node.text) parts.push(node.text)
    else if (node.type === 'linebreak') parts.push(' ')
    node.children?.forEach(walk)
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listitem') parts.push(' ')
  }
  root.children?.forEach(walk)
  const text = parts.join('').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, '')}…` : text
}
