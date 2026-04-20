export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Price cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />
        ))}
      </div>

      {/* Chart skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div className="skeleton" style={{ height: 460, borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 14 }} />
        </div>
      </div>

      {/* News skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}
