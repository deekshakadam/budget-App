// BUDGET CONTROLLER
var budgetController=(function(){
    var Expense = function(id, description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    
    Expense.prototype.calcPercentage= function(totalIncome){
        if(totalIncome>0){
           this.percentage = Math.round((this.value/totalIncome) * 100); 
        }
        else
        {
            this.percentage = -1;
        }
        
             
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
        
    };
    var Income = function(id, description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    
    //var allExpenses=[];
    //var allIncomes=[];
    //var TotalExpense=0;
    
    //better way to store data
    
    var data={
        allItems: {
            exp:[],
            inc:[]
        },
        total:{
            exp :0,
            inc:0
        },
        budget:0,
        percentage:-1
        
    };
    
    var calculateTotal= function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum+= cur.value;
        });
        data.total[type]=sum;
    }
    
    return{
        addItem : function(type,desc,val){
            var newItem,ID;
            //create new ID
            if(data.allItems[type].length > 0){
                //ID = data.allItems[type][data.allItems[type].length - 1].id +  1;
                ID = data.allItems[type][data.allItems[type].length - 1].id +  1;
            }
            else{
                ID=0;
    
            }
            
            // create new ITEM 
            if(type==='exp')
            {
                    
                    newItem = new Expense(ID,desc,val);
            }
            else if(type ==='inc')
            {
                  newItem  =new Income(ID,desc,val);  
            }
            data.allItems[type].push(newItem);// push newitem to data structure 
            return newItem;  // return new element
                   
            
        },
        
        deleteItem : function(type,id){
            var ids,index;
            
            ids= data.allItems[type].map(function(current){
                return current.id;
            });
            
            index=ids.indexOf(id);
            if(index!== -1)
                {
                    data.allItems[type].splice(index,1);
                }
            
            
        },
        
        calculateBudget : function(){
            // calculate total income and total expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate budget
            data.budget=data.total.inc - data.total.exp;
            
            // calculate budget percentage
            if(data.total.inc > 0 ){
                data.percentage=Math.round((data.total.exp / data.total.inc) * 100);
            }
            else{
                data.percentage=-1;
            }
            
            
        },
        
        calculatePercentage : function(){
               data.allItems.exp.forEach(function(current){
                   current.calcPercentage(data.total.inc);
               });
                               
        },
        
        getPercentage : function(){
          var allPerc = data.allItems.exp.map(function(cur){
              return cur.percentage;
          }) ;
          return allPerc;
        },
        
        
        getBudget : function(){
            return {
                budget : data.budget,
                perc : data.percentage,
                totalExp : data.total.exp,
                totalInc : data.total.inc
                
            }
            
        },
        testing: function(){
            console.log(data);
        }
    }
    
})();



////UI CONTROLLER
var UIController=(function(){
    var DOMString ={
        inputType :'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        expenseContainer:'.expenses__list',
        incomeContainer:'.income__list',
        budgetLabel : '.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container :'.container',
        expensePercLabel : '.item__percentage',
        monthLabel:'.budget__title--month'
    };
    
    var formatNumbers = function(num,type){
            var numSplit,int,dec;
            // +,- to  before numbers
            // 2 decimal points 
            // comma separated numbers
            num= Math.abs(num);
            num=num.toFixed(2); // return  to string 
            numSplit =num.split('.')
            int=numSplit[0];
            dec=numSplit[1];
            
            if(int.length > 3 )
                {
                    int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
                }
            
            return (type==='exp' ? sign='-' : sign= '+') + ' ' + int + '.' + dec;
            
            
        };
      var nodeListForEach=function(list,callback){
                for(var i=0;i< list.length;i++){
                    callback(list[i],i);
                }
            };
    return {
        getinput: function(){
            return {
                type: document.querySelector(DOMString.inputType).value,  //inc or exp
                description: document.querySelector(DOMString.inputDescription).value,
                value : parseFloat(document.querySelector(DOMString.inputValue).value),
            };
             
        },
        
        addListItem: function(obj,type){
            var html,newHtml,element;
            
            //create htl string with place holder 
            if(type==='inc'){
                element = DOMString.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type==='exp'){
                element= DOMString.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            
            // replace placeholder with actual value
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumbers(obj.value,type));
            
            //insert html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
            
        },
        deleteListItem: function(itemID){
            var element;
            element = document.getElementById(itemID);
            element.parentNode.removeChild(element);
            
        },
        clearFields : function(){
        
            var fields,fieldsArr;
            fields = document.querySelectorAll(DOMString.inputDescription + ','+DOMString.inputValue);  // returns list
            
            fieldsArr= Array.prototype.slice.call(fields); // converts list to array
            
            // instead of for
            fieldsArr.forEach(function(current,index,array){
                current.value='';  // value is cleared     
         });
           fieldsArr[0].focus(); 
            
        },
        
        displayBudget : function(obj){
            (obj.budget>0)? type='inc' : type='exp';
           document.querySelector(DOMString.expenseLabel).textContent= formatNumbers(obj.totalExp,'exp'); 
           document.querySelector(DOMString.incomeLabel).textContent = formatNumbers(obj.totalInc,'inc'); 
           document.querySelector(DOMString.budgetLabel).textContent = formatNumbers(obj.budget,type); 
            
           if(obj.perc > 0 ){
              document.querySelector(DOMString.percentageLabel).textContent= obj.perc+ '%'; 
           }
           else{
                 document.querySelector(DOMString.percentageLabel).textContent= '--';
           }
            
        
        },
        
        displayPercentage : function(percentages){
            
            var fields= document.querySelectorAll(DOMString.expensePercLabel);  // returns nodelist
            
           
            
            nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                   current.textContent=percentages[index]+ '%'; 
                }
                else
                    {
                        current.textContent='--';
                    }
                
            });
        },
        
        displayMonth: function(){
            var now,yr ,months;
            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            now= new Date();
            yr=now.getFullYear();
            
            
            document.querySelector(DOMString.monthLabel).textContent = months[now.getMonth()] + ' ' + yr;
            
            
        },
        
        changeType: function(){
            var fields= document.querySelectorAll(
                DOMString.inputType + ',' +
                DOMString.inputDescription+ ',' +
                DOMString.inputValue );
            
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMString.inputBtn).classList.toggle('red');
        },
        getDOMstring: function(){
            return DOMString;
        }
    };
    
})();


///GOBAL APP CONTROLLER
var controller=(function(budgetCtrl,UICtrl){
    
    // this module works as cpontroller bwtween other two module. there for we'll pass other two modules as an argument, so this controller can know abt these modules and can connect them
    
    var setupEventListner= function(){
         var DOM=UICtrl.getDOMstring();
         document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
         document.addEventListener('keypress',function(event){
         if(event.keyCode===13 || event.which===13){
            ctrlAddItem();
         }   
        
         });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
        
    };
    var updateBudget= function(){
        var budget;
         //1. calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return budget 
        budget=budgetCtrl.getBudget();
        console.log(budget);
        //3. display budget on UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentage= function(){
        // calculate percentage
        budgetCtrl.calculatePercentage();
        // get percentage from budget contl
        var percentages = budgetCtrl.getPercentage();
        
        // shopw UI percentage 
        UICtrl.displayPercentage(percentages);
        
    };
    
    var ctrlAddItem= function(){
        
        var newItem,input;
        
        // 1.get the input data
        input= UIController.getinput();
        
        if(input.description!=="" && !isNaN(input.value) && input.value>0)
        {
         // 2. add the item to budget controller
         newItem= budgetCtrl.addItem(input.type,input.description,input.value);
        
        //3.add the item to UI
        UICtrl.addListItem(newItem,input.type);
        
        // 4.clear fields
         UICtrl.clearFields();
        
        // 5. calculate and update budget
        updateBudget();
            
            //6.calculate and show percentage
            updatePercentage();
        
        }
    };
    
    var ctrlDeleteItem= function(event){
        var itemID,splitID,type,ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split('-');
            type=splitID[0];
            ID=parseInt(splitID[1]);
            
            // 1.delete item from datastructure
             budgetCtrl.deleteItem(type,ID);
            // delete item from UI
              UICtrl.deleteListItem(itemID);
            //update and show budget
             updateBudget();
            
            // calculate  and show percentage
            updatePercentage();
            
        
        }
        
    };
    
    return{
        init : function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            setupEventListner();
            UICtrl.displayBudget({budget : 0,
                perc : -1,
                totalExp : 0,
                totalInc : 0});
        }
        
    }
    
})(budgetController,UIController);


controller.init();