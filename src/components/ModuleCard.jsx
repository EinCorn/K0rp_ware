function ModuleCard({ module }) {
  return (
    <article className="module-card">
      <div>
        <p className="system-label">{module.eyebrow}</p>
        <h2>{module.title}</h2>
        <p>{module.description}</p>
      </div>
      <div className="module-card-footer">
        <span className="module-status">{module.status}</span>
        <a href={`/?app=${module.id}`}>Open</a>
      </div>
    </article>
  )
}

export default ModuleCard
