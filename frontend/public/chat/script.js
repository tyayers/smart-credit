(function(){
  
  var chat = {
    messageToSend: '',
    messageResponses: [
      'Why did the web developer leave the restaurant? Because of the table layout.',
      'How do you comfort a JavaScript bug? You console it.',
      'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
      'What is the most used language in programming? Profanity.',
      'What is the object-oriented way to become wealthy? Inheritance.',
      'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
    ],
    imagesrc: '',
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$button = $('button');
      this.$textarea = $('#message-to-send');
      this.$imageinput = $('#image-input');
      this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
      this.$imageinput.on('change', this.addImage.bind(this));
    },
    render: function() {
      this.scrollToBottom();
      if (this.messageToSend.trim() !== '') {
        var template = Handlebars.compile( $("#message-template").html());
        var context = { 
          messageOutput: this.messageToSend,
          imageSrc: this.imagesrc,
          time: this.getCurrentTime()
        };

        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val('');
        
        // responses
        var responseText = this.getRandomItem(this.messageResponses);
        if (this.messageToSend.toLowerCase().includes("great") || this.messageToSend.toLowerCase().includes("good"))
          responseText = "Great!  Then I'll apply that for you, you can see the status in our app, or just ask me for details."

        var templateResponse = Handlebars.compile( $("#message-response-template").html());
        var contextResponse = { 
          response: responseText,
          time: this.getCurrentTime()
        };
        
        setTimeout(function() {
          this.$chatHistoryList.append(templateResponse(contextResponse));
          this.scrollToBottom();
        }.bind(this), 1500);
        
      }
      else if (this.imagesrc.trim() !== '') {
        var template = Handlebars.compile( $("#message-template").html());
        var context = { 
          messageOutput: this.messageToSend,
          imageSrc: this.imagesrc,
          time: this.getCurrentTime()
        };

        this.$chatHistoryList.append(template(context));
        this.$textarea.val('');
        this.imagesrc = "";
        this.$imageinput.val('');

        setTimeout(function() {
          this.scrollToBottom();
        }.bind(this), 200); 
        
        // responses

        axios.post('https://emea-poc13-prod.apigee.net/smart-credit/credit/calculate-rate?apikey=A7WOGAFWaotaIutI8GbuIAPJg5OZGeIQ', {
          months: '48',
          images: {
            requests: [
              {
                image: {
                  content: context.imageSrc.split(',')[1]
                },
                features: [{type: "LABEL_DETECTION"}]
              }
            ]
          }
        })
        .then(function (response) {
          console.log(response);
          var templateResponse = Handlebars.compile( $("#message-response-template").html());
          var message = 
`Here's what we can do to finance a ${response.data.objectType}:
Estimated credit amount: $${response.data.objectValue} 
Recommended credit length: ${response.data.months} months
Effective interest rate: ${response.data.effectiveInterestRate}%
Monthly rate: $${response.data.rate}
`;

          if (response.data.addOns.length > 0) {
            message = message + `Add-ons from our partners: `;
            for (i = 0; i < response.data.addOns.length; i++) {
              message = message + `
    - ${response.data.addOns[i].providerName} + $${response.data.addOns[i].rate}`;
            }
          }

          var contextResponse1 = { 
            response: message,
            time: this.getCurrentTime()
          };

          var contextResponse2 = { 
            response: "What do you think?",
            time: this.getCurrentTime()
          };          
          
          setTimeout(function() {
            this.$chatHistoryList.append(templateResponse(contextResponse1));
            this.$chatHistoryList.append(templateResponse(contextResponse2));
            this.scrollToBottom();
          }.bind(this), 1500); 
        }.bind(this))
        .catch(function (error) {
          console.log(error);
        });
      }
      
    },
    
    addMessage: function() {
      this.messageToSend = this.$textarea.val()
      this.render();         
    },
    addImage: function() {
      if (this.$imageinput[0].files && this.$imageinput[0].files[0]) {

        var reader = new FileReader();
        var me = this;
        reader.onload = function(e) {

          me.imagesrc = e.target.result;
          me.render(); 
        };

        reader.readAsDataURL(this.$imageinput[0].files[0]);
        
      }              
    },    
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
    
  };
  
  chat.init();
  
  var searchFilter = {
    options: { valueNames: ['name'] },
    init: function() {
      var userList = new List('people-list', this.options);
      var noItems = $('<li id="no-items-found">No items found</li>');
      
      userList.on('updated', function(list) {
        if (list.matchingItems.length === 0) {
          $(list.list).append(noItems);
        } else {
          noItems.detach();
        }
      });
    }
  };
  
  searchFilter.init();
})();