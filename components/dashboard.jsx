import React, { useEffect, useState } from 'react';
import { Box, H2, Text } from '@adminjs/design-system';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/admin/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <Text>Cargando...</Text>;

  return (
    <Box variant="grey">
      <H2>Panel general</H2>

      <Box mt="xl" display="grid" gridTemplateColumns="1fr 1fr 1fr" gridGap="20px">

        <Box p="lg" variant="white">
          <H2>{stats.totalMiembros}</H2>
          <Text>Total Miembros</Text>
        </Box>

        <Box p="lg" variant="white">
          <H2>{stats.totalReclutas}</H2>
          <Text>Total Reclutas</Text>
        </Box>

        <Box p="lg" variant="white">
          <H2>{stats.totalGeneral}</H2>
          <Text>Total General</Text>
        </Box>

        <Box p="lg" variant="white">
          <H2>{stats.pendientes}</H2>
          <Text>Pendientes de pago</Text>
        </Box>

        <Box p="lg" variant="white">
          <H2>{stats.pendientesMiembros}</H2>
          <Text>Miembros pendientes</Text>
        </Box>

        <Box p="lg" variant="white">
          <H2>{stats.pendientesReclutas}</H2>
          <Text>Reclutas pendientes</Text>
        </Box>

      </Box>
    </Box>
  );
};

export default Dashboard;
