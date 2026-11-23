import { Header } from "../../components/Header/Header";
import { Stack } from "../../components/Stack/Stack";
import { Card } from "../../components/Card/Card";
import { CardWrapper } from "../../components/CardWrapper/CardWrapper";
import { Callout } from "../../components/Callout/Callout";
import { useDirectorDashboard } from "../../hooks/useDirectorDashboard";

export function DirectorDashboardPage() {
  const { stats, quickLinks, error, greeting } = useDirectorDashboard();

  return (
    <Stack gap="lg">
      <Header title="Panel de Dirección" subtitle={`Bienvenido/a, ${greeting}`} />
      {error && <Callout variant="danger" message={error} />}

      <CardWrapper columns={4} title="Resumen">
        {stats.map((stat) => (
          <Card
            key={stat.id}
            variant="stat"
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </CardWrapper>

      <CardWrapper columns={quickLinks.length > 3 ? 4 : 3} title="Accesos rápidos">
        {quickLinks.map((link) => (
          <Card
            key={link.id}
            variant="info"
            title={link.title}
            description={link.description}
            onClick={link.onClick}
          />
        ))}
      </CardWrapper>
    </Stack>
  );
}
