import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsChartProps {
  data: Array<{
    time: string;
    cpu: number;
    memory: number;
    storage?: number;
  }>;
}

export default function MetricsChart({ data }: MetricsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="time"
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#fff'
          }}
        />
        <Legend
          wrapperStyle={{ color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          stroke="#a78bfa"
          strokeWidth={2}
          name="CPU (%)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="memory"
          stroke="#60a5fa"
          strokeWidth={2}
          name="Mémoire (%)"
          dot={false}
        />
        {data[0]?.storage !== undefined && (
          <Line
            type="monotone"
            dataKey="storage"
            stroke="#34d399"
            strokeWidth={2}
            name="Stockage (%)"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
