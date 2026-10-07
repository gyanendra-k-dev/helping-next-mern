function PageHeader({ title, subtitle, action, onAction }) {
  return (
    <div className="dash-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAction}
          disabled={!onAction}
          title={onAction ? undefined : "Not available yet"}
        >
          {action}
        </button>
      )}
    </div>
  );
}

export default PageHeader;
