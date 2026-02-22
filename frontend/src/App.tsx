import { useEffect, useState } from 'react';
import axios from 'axios';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime?: number;
}

export default function App() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/health');
        setHealthStatus(response.data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect to backend';
        setError(errorMessage);
        setHealthStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎯 Sistema de Controle e Comparação de Impostos</h1>
      <p>Setup inicial — Verificando conexão com backend...</p>

      {loading && <p>⏳ Carregando...</p>}

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          ❌ Erro: {error}
          <p>
            <small>
              Certifique-se de que o backend está rodando com <code>npm run dev</code>
            </small>
          </p>
        </div>
      )}

      {healthStatus && (
        <div style={{ color: 'green', padding: '10px', border: '1px solid green', borderRadius: '4px' }}>
          ✅ Backend conectado!
          <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
        </div>
      )}

      <hr />
      <p>
        <strong>Próximos passos:</strong>
      </p>
      <ul>
        <li>STORY-1.2: Modelo de dados</li>
        <li>STORY-1.3: Autenticação JWT</li>
        <li>STORY-1.4: RLS no PostgreSQL</li>
        <li>STORY-1.5: Roles & Permissões</li>
      </ul>
    </div>
  );
}
