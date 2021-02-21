const Modal = 
{
  open()
  {//toogle()
      // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

  },
  close()
  {
      // fechar o modal
        // remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
  },
}
//local para armazenar no navegador - guarda como string
const Storage = 
{
  //pegando as informações
  get() 
  {
    //transformar a string em um array - parse() transforma em array ou obj
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  //guardar - setar as informações
  set(transactions) 
  {
    //recebe 2 argumentos - chave e o valor
      localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));

      //JSON.stringify - transformando em string as transaction
  }
}

const Transaction = 
{
  all: Storage.get(),

  add(transaction)
  {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index)
  {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() 
  {
    let income = 0;
    //pegando todas transactions, para cada transacao
    Transaction.all.forEach(transaction => 
      {
      if( transaction.amount > 0 ) 
      {
          income += transaction.amount;
      }
  });
  return income;
  },

  expenses() 
  {
    let expense = 0;
      //pegando todas transactions, para cada transacao
      Transaction.all.forEach(transaction => 
        {
        if( transaction.amount < 0 ) 
        {
            expense += transaction.amount;
        }
    });
    return expense;
  },

  total() 
    {
      //ja tem o - no util
      return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = 
{
  //ATRIBUTO/PROPRIEDADE DESSE METODO
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) 
  {
      const tr = document.createElement('tr');
      tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
      tr.dataset.index = index;

      DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) 
  {
      const CSSclass = transaction.amount > 0 ? "income" : "expense"

      const amount = Utils.formatCurrency(transaction.amount)

      const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
      `

      return html
  },

  updateBalance() 
  {
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

  clearTransactions() 
  {
      DOM.transactionsContainer.innerHTML = "";
  }
}

const Utils =
{
  formatAmount(value)
  {
    // transformando em numero e tratando quem digita ponto no valor
    //trocando ponto e virgulas para vazio, seleciona virgula ou ponto de maneira global substituido por vazio
    value = Number(value.replace(/\,\./g, "")) * 100;

    //Math.round arredonda o elemento
    return Math.round(value);
  },

  //retorno de um valor formatado -> recebendo string do formulario
  formatDate(date)
  {
    const splittedDate = date.split("-");
    //dia/mes/ano
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value)
  {
    const signal = Number(value) < 0 ? "-" : "";
    // spkip  /\D/g -> expressão regular // -> g pesquisa global ->\D careter sem ser numero - ache tudo que não for numero
    value = String(value).replace(/\D/g, "");

    // para definir o numero ex.: 500000 / 100 = 5k
    value = Number(value) / 100;

    //toLocaleString - 2 argumentos, 1º informa a localização 2ºopçoes de obj do metodo
    value = value.toLocaleString("pt-BR", 
    {
      style: "currency",
      currency: "BRL"
    });

    return signal + value;
  }
}

const Form = 
{
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  //pegando somente valores
  getValues()
  {
    return{
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields()
  {
        //const description = Form.getValues().description;
    //destruturação
    const {description, amount, date} = Form.getValues();
    //verificando se está vazio - trim serve pra limpar espaço vazio
    if(description.trim() === "" || amount.trim() === "" || date.trim() === "")
    {
      //jogar pra fora - criando um novo erro
      throw new Error("Por favor, preencha todos os campos");
    }   
  },

  formatValues()
  {
    let {description, amount, date} = Form.getValues();
    //amout vai receber do util o metodo formatAmount
    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return { description, amount, date };
  },

  saveTransaction(transaction)
  {
    Transaction.add(transaction);
  },

  clearFields()
  {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event)
  {
    //previnir o padrão
    event.preventDefault();
    //capturando o erro se algum processo falhar
    try{
      //verificar se todas as informações foram preenchidas
      Form.validateFields();

      //formatando os dados
      const transaction = Form.formatValues();

      //salvar dados
      Form.saveTransaction(transaction);
      
      //apagar os dados do formulario 
      Form.clearFields();
      //fecha o modal - formulario
      Modal.close();

    }
    catch(e)
    {
      alert(e.message);
    }
  }
}

const App = 
{
  init()
  {      //populou
      Transaction.all.forEach((transaction, index) => 
      {
        DOM.addTransaction(transaction, index);
      });

      DOM.updateBalance();
      //atualizando aonde está guardando os dados
      Storage.set(Transaction.all);
     
  },
  //reload para iniciar
  reload()
  {
    DOM.clearTransactions();
    App.init();
  },
}
//iniciou
App.init();
/* 
//adicionou
Transaction.remove(2); */
