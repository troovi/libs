export interface TableProps<T> {
  header: { content: React.ReactNode; style?: React.CSSProperties }[]
  items: T[]
  getItemLayout: (item: T, index: number) => React.ReactNode[]
  onRowClick?: (item: T) => void
  className?: string
}

export const Table = <T,>({ header, items, getItemLayout, className, onRowClick }: TableProps<T>) => {
  return (
    <table className={className}>
      <colgroup>
        {header.map(({ style }, i) => (
          <col key={`colgroup-col-${i}`} style={style} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {header.map(({ content }, i) => (
            <th key={`header-th-${i}`}>{content}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={`table-tr-${i}`} onClick={() => onRowClick?.(item)}>
            {getItemLayout(item, i).map((content, n) => (
              <td key={`table-td-${i}-${n}`}>{content}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
