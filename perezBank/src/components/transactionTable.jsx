import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

const TransactionTable = ({ accounts, currentSlideIndex }) => {
    const data = React.useMemo(
        () => accounts.userAccounts,
        [accounts]
    );

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

 
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (!data) {
        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} align="center">No hay datos disponibles</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }


    const paginatedData = data[currentSlideIndex].transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TableContainer component={Paper} style={{ maxHeight: '85%', overflowY: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Cuenta de origen</TableCell>
                            <TableCell>Cuenta de destino</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Fecha</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map(row => (
                            <TableRow key={row.Id}>
                                <TableCell>{row.Id}</TableCell>
                                <TableCell>{row.TransactionType}</TableCell>
                                <TableCell>{row.OriginAccountNumber == null ? "Banco" : row.OriginAccountNumber}</TableCell>
                                <TableCell>{row.TargetAccountNumber == null ? "Banco" : row.TargetAccountNumber}</TableCell>
                                <TableCell>{row.Amount}</TableCell>
                                <TableCell>{row.Date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination style={{ maxHeight: '100%', overflowY: 'none'}}
                component="div"
                count={data[currentSlideIndex].transactions.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Filas por página"
            />       
        </Paper>
    );
};

export default TransactionTable;
