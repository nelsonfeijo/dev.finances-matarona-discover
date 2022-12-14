const Modal = {
    open(){
        //quando add a class abre o modal, quando tira ele fecha 
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1),
        App.reload()
    },
    incomes () {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })
        //para cada transação, se ela for maior que zero somar a uma variavel e tornar a variavel
        return income;
    },
    expenses () {
        let expense = 0;
        Transaction.all.forEach((transaction)=>{
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        //para cada transação, se ela for maior que zero somar a uma variavel e tornar a variavel
        return expense;
    },
    total () {
        return Transaction.incomes() + Transaction.expenses();
    }
}

//Substituir os dados do html com os dados do js
const DOM = {
    transactionsConteiner: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsConteiner.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html =  `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html
    },
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsConteiner.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value.replace(/\,\./g, "")) * 100
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    //verificar se todas as infos foram preenchidas
    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }
    },
    //formatar os dados para salvar
    formatValues() {
        let { description, amount, date } = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()
        try {
            //capturar o erro 
            Form.validateFields()
            //formatar os dados para salvar
            const transaction = Form.formatValues()
            //salvar
            Transaction.add(transaction)
            //apagar os dados do formulario
            Form.clearFields()
            //modal feche dps de salvar 
            Modal.close()
            //atualizar a aplicação
        } catch (error){
            alert(error.message)
        }



    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}
App.init()

