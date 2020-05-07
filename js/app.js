// BUDGET CONTROLLER
const budgetController = (function () {

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach((cur) => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {

        addItem: (type, des, val) => {
            var newItem, ID;

            // [1 2 3 4 5], next ID = 6
            // [1 2 4 6 8], next ID = 9
            // ID = last D + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure 
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: (type, id) => {

            let ids, index;

            ids = data.allItems[type].map((current) => {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {

            // 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of income that we have spent

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

            // Expense = 100 and Income 200, spent 50% = 100/200 = 0.5 * 100
        },

        calculatePercentages: () => {

            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */

            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: () => {
            var allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: () => {
            console.log(data);
        }
    };

})();



// UI CONTROLLER
const UIController = (() => {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = (num, type) => {
        var numSplit, int, dec, type;
        /*
            + or - before the number
            exactly to decimal points
            coma separating the thousands

            eg 2310.4567 -> + 2,310.46
            200 -> 2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };


    var nodeListForEach = (list, callback) => {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;
            // Create HTMl String with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder with some actual data

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: (selectorID) => {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index, array) => {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: (obj) => {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: (percentages) => {

            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, (current, index) => {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: () => {

            var now, month, year;

            now = new Date;
            months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: () => {
            return DOMStrings; // The retursn private DOMStrings into the public
        }
    }

})();


//GLOBAL APP CONTROLLER
const appController = ((budgetCtrl, UICtrl) => {

    const setUpEventListeners = () => {
        const DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress', (ev) => {
            if (ev.keyCode === 13 || ev.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    const updateBudget = () => {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. A method that returns the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the calculated budget on the UI 
        UICtrl.displayBudget(budget);
    };


    const updatePercentages = () => {

        // 1. Calculate the percenytages
        budgetCtrl.calculatePercentages();

        // 2. Read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentage
        UICtrl.displayPercentages(percentages);
    };


    const ctrlAddItem = () => {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the new item to the unpaid
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update perscentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = (ev) => {

        var itemID, splitID, type, ID;

        itemID = ev.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from the data structure
            budgetCtrl.deleteitem(type, ID);

            // 2. Delete Item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4 . Calculate and update perscentages
            updatePercentages();
        }
    };

    // Create public initialization function
    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

appController.init();