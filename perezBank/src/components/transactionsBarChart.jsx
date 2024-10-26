import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

function categorizeTransactions(transactions, accountId) {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const categorized = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.Date);
        const month = `${months[date.getMonth()]}`;

        if (!categorized[month]) {
            categorized[month] = { name: month, ingresos: 0, gastos: 0 };
        }

        if (transaction.OriginAccount === accountId) {
            categorized[month].gastos += parseFloat(transaction.Amount);
        } else if (transaction.TargetAccount === accountId) {
            categorized[month].ingresos += parseFloat(transaction.Amount);
        }
    });

    const result = Object.keys(categorized).map(key => ({
        name: categorized[key].name,
        ingresos: categorized[key].ingresos,
        gastos: categorized[key].gastos
    }));

    return result;
}

const TransactionsBarChart = ({accounts, currentSlideIndex}) => {
  if(accounts.length === 0){
    return(
      <p>Cargando...</p>
    )
  }else{
    const categorizedTransactions = categorizeTransactions(accounts.userAccounts[currentSlideIndex].transactions, accounts.userAccounts[currentSlideIndex].account.Id);
    console.log(categorizedTransactions);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={categorizedTransactions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <defs>
            <linearGradient id="Gradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--Corp5)" />
              <stop offset="100%" stopColor="var(--Corp1)" />
            </linearGradient>
            <linearGradient id="Gradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000328" />
              <stop offset="100%" stopColor="#00458E" />
            </linearGradient>
          </defs>
          <Bar dataKey="ingresos" fill="url(#Gradient1)">
              <LabelList dataKey="ingresos" position="top" />
          </Bar>
          <Bar dataKey="gastos" fill="url(#Gradient2)">
              <LabelList dataKey="gastos" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
};

export default TransactionsBarChart;