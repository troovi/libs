export type IconPathData = string | string[]

export type IconData = [
  number, // width
  number, // height
  (string | number)[], // ligatures
  string, // unicode
  IconPathData // svgPathData
]
