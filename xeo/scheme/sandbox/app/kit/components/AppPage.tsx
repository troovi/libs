import { Link } from 'react-router'

interface AppPageProps {
  title: React.ReactNode
  /** Возврат к списку — ссылка над заголовком записи. */
  back?: { to: string; title: string }
  /** Справа от заголовка — число записей, состояние. */
  aside?: React.ReactNode
  children?: React.ReactNode
}

/** Страница приложения: заголовок (у записи — со ссылкой назад к списку) и содержимое столбцом. */
export const AppPage = ({ title, back, aside, children }: AppPageProps) => {
  return (
    <div className="app-page">
      {back && (
        <Link className="app-page-back" to={back.to}>
          ← {back.title}
        </Link>
      )}
      <div className="app-page-head">
        <h1 className="app-page-title">{title}</h1>
        {aside && <div className="app-page-aside">{aside}</div>}
      </div>
      {children}
    </div>
  )
}

/** Блок страницы записи — связанные записи под своим заголовком. */
const AppPageSection = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => {
  return (
    <section className="app-page-section">
      <h2 className="app-page-section-title">{title}</h2>
      {children}
    </section>
  )
}

/** Страница одним состоянием — записи нет, страницы нет. */
const AppPageEmpty = ({ children }: { children: React.ReactNode }) => {
  return <div className="app-page-empty">{children}</div>
}

AppPage.Section = AppPageSection
AppPage.Empty = AppPageEmpty
