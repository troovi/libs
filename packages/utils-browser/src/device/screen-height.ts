import { px, setCssVariable } from '../css'

export const deviceHeightListener = (minWidth: number, varname: string = '--app-height') => {
  if (window.innerWidth < minWidth) {
    const appHeight = () => {
      setCssVariable(varname, px(window.innerHeight))
    }

    window.addEventListener('resize', appHeight)
    appHeight()
  }
}
