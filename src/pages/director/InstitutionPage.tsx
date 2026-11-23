import { Header } from "../../components/Header/Header";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Stack } from "../../components/Stack/Stack";
import { Callout } from "../../components/Callout/Callout";
import { LoadingState } from "../../components/LoadingState/LoadingState";
import { PageSection } from "../../components/PageSection/PageSection";
import { Form } from "../../components/Form/Form";
import { useInstitutionSettings } from "../../hooks/useInstitutionSettings";
import { ROUTES } from "../../config/navigation.config";

export function InstitutionPage() {
  const settings = useInstitutionSettings();

  return (
    <Stack gap="lg">
      <Breadcrumbs
        items={[{ label: "Inicio", href: ROUTES.director.dashboard }, { label: "Institución" }]}
      />
      <Header
        title="Configuración institucional"
        subtitle="Datos del instituto y reglas académicas (solo SuperAdmin)"
      />
      {settings.error && <Callout variant="danger" message={settings.error} />}

      {settings.isLoading ? (
        <LoadingState message="Cargando configuración..." />
      ) : (
        <PageSection
          variant="surface"
          title="Parámetros"
          description="Los cambios impactan en la validación de inscripciones de todos los alumnos."
        >
          <Form
            fields={settings.fields}
            values={settings.values}
            errors={settings.errors}
            onChange={settings.onChange}
            onSubmit={settings.onSubmit}
            submitLabel="Guardar configuración"
            isLoading={settings.isSaving}
          />
        </PageSection>
      )}
    </Stack>
  );
}
