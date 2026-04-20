import { Box, H1, Text, Card, Illustration } from '@adminjs/design-system'
import { useTranslation, useNotice, ApiClient } from 'adminjs'
import { useEffect, useState } from 'react'

const api = new ApiClient()

const DashboardFEAR = () => {
  const [stats, setStats] = useState({ reclutas: 0, usuarios: 0 })

  useEffect(() => {
    api.getPage({ pageName: 'dashboard' }).then((res) => {
      setStats(res.data)
    })
  }, [])

  return (
    <Box variant="grey">
      <H1>Dashboard FEAR</H1>

      <Box mt="xl" display="flex" flexDirection="row" gap="20px">

        <Card width="300px" p="lg">
          <Illustration variant="Rocket" />
          <Text mt="md" fontSize="24px" fontWeight="bold">
            {stats.reclutas}
          </Text>
          <Text>Reclutas registrados</Text>
        </Card>

        <Card width="300px" p="lg">
          <Illustration variant="DocumentSearch" />
          <Text mt="md" fontSize="24px" fontWeight="bold">
            {stats.usuarios}
          </Text>
          <Text>Usuarios del panel</Text>
        </Card>

      </Box>
    </Box>
  )
}

export default DashboardFEAR
