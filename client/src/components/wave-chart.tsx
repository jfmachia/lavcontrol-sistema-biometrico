import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessData {
  time: string;
  store_name: string;
  access_count: number;
}

interface WaveChartProps {
  className?: string;
  selectedStores?: string[];
}

export function WaveChart({ className, selectedStores = [] }: WaveChartProps) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  
  const { data: accessData, isLoading } = useQuery<AccessData[]>({
    queryKey: ['/api/dashboard/wave-chart'],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  useEffect(() => {
    if (!canvasRef || !accessData || accessData.length === 0) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    // Configurações do gráfico
    const width = canvasRef.width;
    const height = canvasRef.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Filtrar dados por lojas selecionadas
    const filteredData = selectedStores.length > 0 
      ? accessData.filter(item => selectedStores.includes(item.store_name))
      : accessData;

    // Agrupar dados por loja
    const storeGroups = filteredData.reduce((acc, item) => {
      if (!acc[item.store_name]) {
        acc[item.store_name] = [];
      }
      acc[item.store_name].push(item);
      return acc;
    }, {} as Record<string, AccessData[]>);

    const stores = Object.keys(storeGroups);
    const maxAccess = Math.max(...filteredData.map(d => d.access_count), 1);
    
    // Cores para cada loja (tons do tema LavControl)
    const colors = [
      'rgba(34, 197, 94, 0.8)',   // Verde
      'rgba(59, 130, 246, 0.8)',  // Azul  
      'rgba(168, 85, 247, 0.8)',  // Roxo
      'rgba(249, 115, 22, 0.8)',  // Laranja
      'rgba(236, 72, 153, 0.8)',  // Rosa
      'rgba(14, 165, 233, 0.8)',  // Azul claro
      'rgba(34, 197, 94, 0.6)',   // Verde claro
      'rgba(251, 146, 60, 0.8)',  // Laranja claro
    ];

    // Desenhar fundo
    ctx.fillStyle = 'rgba(15, 23, 42, 0.02)';
    ctx.fillRect(0, 0, width, height);

    // Desenhar grade
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight * i) / 10;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Linhas verticais
    for (let i = 0; i <= 24; i++) {
      const x = padding + (chartWidth * i) / 24;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Desenhar ondas para cada loja
    stores.forEach((storeName, storeIndex) => {
      const storeData = storeGroups[storeName];
      const color = colors[storeIndex % colors.length];
      
      // Ordenar dados por hora
      storeData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      // Desenhar linha ondulada
      ctx.strokeStyle = color;
      ctx.fillStyle = color.replace('0.8)', '0.2)');
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      
      // Criar pontos suavizados para efeito de onda
      const points: {x: number, y: number}[] = [];
      
      storeData.forEach((point, index) => {
        const hour = new Date(point.time).getHours();
        const x = padding + (chartWidth * hour) / 24;
        const y = height - padding - (chartHeight * point.access_count) / maxAccess;
        
        // Adicionar variação senoidal para efeito de onda
        const waveOffset = Math.sin(hour * Math.PI / 12 + storeIndex * Math.PI / 3) * 5;
        points.push({ x, y: y + waveOffset });
      });
      
      // Desenhar curva suave usando curvas de Bézier
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 1; i++) {
          const cpx = (points[i].x + points[i + 1].x) / 2;
          const cpy = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);
        }
        
        if (points.length > 1) {
          ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        }
        
        // Fechar área para preenchimento
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.lineTo(points[0].x, height - padding);
        ctx.closePath();
        
        // Preencher área
        ctx.fill();
        
        // Desenhar linha
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const cpx = (points[i].x + points[i + 1].x) / 2;
          const cpy = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);
        }
        if (points.length > 1) {
          ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        }
        ctx.stroke();
      }
    });

    // Desenhar legendas dos eixos
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    // Eixo X (horas)
    for (let i = 0; i <= 24; i += 4) {
      const x = padding + (chartWidth * i) / 24;
      ctx.fillText(`${i}:00`, x, height - 10);
    }
    
    // Eixo Y (acessos)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i += 2) {
      const y = padding + (chartHeight * (10 - i)) / 10;
      const value = Math.round((maxAccess * i) / 10);
      ctx.fillText(value.toString(), padding - 10, y + 4);
    }

    // Título dos eixos
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillText('Horário', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Acessos', 0, 0);
    ctx.restore();

  }, [canvasRef, accessData, selectedStores]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tráfego de Acessos por Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div>
        <div className="relative">
          <canvas
            ref={setCanvasRef}
            width={800}
            height={400}
            className="w-full h-auto border rounded"
            style={{ maxHeight: '400px' }}
          />
          
          {/* Legenda */}
          <div className="mt-4 flex flex-wrap gap-4">
            {accessData && Object.keys(
              accessData.filter(item => selectedStores.length === 0 || selectedStores.includes(item.store_name))
                      .reduce((acc, item) => {
                acc[item.store_name] = true;
                return acc;
              }, {} as Record<string, boolean>)
            ).map((storeName, index) => {
              const colors = [
                'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
                'bg-pink-500', 'bg-cyan-500', 'bg-green-400', 'bg-orange-400'
              ];
              return (
                <div key={storeName} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                  <span className="text-sm text-muted-foreground">{storeName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}