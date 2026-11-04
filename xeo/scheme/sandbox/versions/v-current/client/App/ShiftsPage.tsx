import { useNavigate } from 'react-router'
import { AppPage, RecordsTable } from '../../../../app/kit'
import { useAll } from '../data'
import { paths } from './paths'

/** Все смены локальной базы, свежие сверху; строка ведёт в запись. */
export const ShiftsPage = () => {
  const navigate = useNavigate()

  const shifts = useAll('shift')

  return (
    <AppPage title="Смены" aside={shifts.length}>
      <RecordsTable
        rows={[...shifts].reverse()}
        onRowClick={(shift) => navigate(paths.shift(shift.shiftId))}
      />
    </AppPage>
  )
}
