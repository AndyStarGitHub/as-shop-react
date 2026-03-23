import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { Chip, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"

export  const InventoryLogsPage = () => {
    const [logs, setLogs] = useState<any[]>([])
    useEffect(() => {
      const q = query(collection(db, 'inventory_logs'), orderBy('createdAt', 'desc'))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setLogs(logsData)
      })
      return () => unsubscribe()
    })
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>📖 Журнал складських операцій</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{bgcolor: 'action.hover'}}>
              <TableRow>
                <TableCell>Даточка</TableCell>
                <TableCell>Товарчик</TableCell>
                <TableCell>Типчик</TableCell>
                <TableCell>Кількість</TableCell>
                <TableCell>Ціна закупівлі</TableCell>
                <TableCell>Коментар</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell sx={{ fontSize: '0.8rem'}}>
                    {log.createdAt?.toDate().toLocaleString('uk-UA')}
                  </TableCell>
                  <TableCell>
                    <strong>{log.productTitle}</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.type === 'income' ? 'ПРИХІД' : 'ВИДАТОК'}
                      color={log.type === 'income' ? 'success' : 'error'}
                      size = 'small'
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <strong>{log.amount > 0 ? `+${log.amount}` : log.amount}</strong>
                  </TableCell>
                  <TableCell align="right">
                    {log.purchasePrice ? `${log.purchasePrice} грн` : '-'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    {log.note}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
    </Container>
  )
}