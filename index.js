// TODO
// [] questions should have some helper text...
// [x] figure out how to display posts and projects (read file etc.)
// --- just grab from simplefiles on github
// [x] conversational vibe -> working on it
// [x] DSL for sheetsu-like? How else to make extensible? -> working on it
// [] loading ani

var state = {
  waitingForReply: false,
  currentConvo: {},
  lastCommand: ''
};

// need a default?
// this could get massive
// also, how the f*** am I fetching posts?
// or maybe I don't really have too many?
// actually, why wouldn't this just be hosted here @
// the single repo. Just give the file a specific name, make an http req
// badda boom, badda bing

// gonna have to change the way this works
// should link to specific questions
// not sure how to encode the convo objects
// switch statement for encoding method calls
// you'll need a regex

var convos = [
  {
    trigger: new RegExp("^\\?{1}$"),
    // startPhras: 'Just starting a convo',
    // thinking that this should be a dictionary
    questions: {
      "start": {
        output: 'Do you need some assistance?',
        default: `I'm sorry, was that a no on the assistance
        then or yes?`,
        replies: [
          [RegExp("yes|yep|ya|yeah|yea"),"more"],
          [RegExp("no|nope|nah"),"end"]
        ]
      },
      "more":{
        output: `Interact with the chatblog using the input box. Ask about Jordan's
        recent projects, the chatblog, or his latest thoughts.`
      },
      "end":{
        output: "Alrighty. I'm here if you need me! Just type: '?'"
      }
    }
  },
  // maybe I just have a single post file
];

var bot = function(){
  this.currentConvo;
  this.currentQuestion;
  this.say = function(phrase){
    buildReply(phrase).render();
  };

  this.startConvo = function(convo){
    this.currentConvo = convo;
    this.currentQuestion = convo.questions["start"];
    b.say(this.currentQuestion.output);
    if(!this.currentQuestion.replies){
      this.currentConvo = '';
      this.currentQuestion = '';
    };
  }

  this.reply = function(input){
    if(!b.currentConvo){
      for(let i in convos){
        if(convos[i].trigger.test(input)){
          // tell the bot to converse and break
          b.startConvo(convos[i]);
          return
        }
      };
      b.say("Interesting...I have, no response to that...");
    } else {
      var replies = this.currentQuestion.replies;
      for(let i in replies){
        // input shouldn't have to match exactly
        if(replies[i][0].test(input)){
          if(replies[i][1] != undefined){
            this.currentQuestion = this.currentConvo.questions[replies[i][1]]
            this.say(this.currentQuestion.output);
            if(!this.currentQuestion.replies){
              // this.currentQuestion = '';
              // this.currentConvo = '';
              this.endConvo();
            };
          } else if(replies[i][2] != undefined) {
            // say the response
            // how do we know we can end the convo?
            this.say(replies[i][2]);
            this.endConvo();
          };
          return;
        }
      };
      this.say(this.currentQuestion.default);
    }
  };

  // unset the generator and q
  this.endConvo = function(){
    this.currentConvo = '';
    this.currentQuestion = '';
  };

  // how do we make the markdown files feel conversational?
  // can I split using a --- or something? Like, divide the markdown basically
  // could work...

  this.gen = '';

  this.q = '';
}

// factory function
var buildReply = function(content){
  return {
    content: content,
    render: function(replyObj){
      console.log("rendering...");
      // just append the object to the dom in some form
      var msgHldr = document.getElementById("msgHldr");
      var botImg = "<div class='botImg img'></div>"
      var newReply = "<div class='msg bot'>" + botImg + "<div class='reply'>" + content + "</div>" + "</div>"
      msgHldr.insertAdjacentHTML('beforeend', newReply);
    }
  }
};

var buildCommandList = function(commands){
  var startTag = "<div class='commandList'>";
  var endTag = "</div>";
}

var replies = [];

function showContent(content){
  var msgHldr = document.getElementById("msgHldr");
  var userImg = "<div class='userImg img'></div>"
  var newReply = "<div class='msg user'>" + "<div class='reply'>" + content + "</div>" + userImg + "</div>"
  msgHldr.insertAdjacentHTML('beforeend', newReply);
}

// when this was a var it was fucked up
// you'll need a convo DSL in some sense

function parseInput(e){
  // e.preventDefault(); // <-- not a submit so not necessary?
  // this will be more programmatic
  var myRegex = /posts|post|bio|about|projects|project|bettles/g;
  // will need a convo object check -> so a sequence of links kinda how
  // botkit works -> so it becomes more conversational
  if(e.which === 13){
    var content = e.target.value.toLowerCase();
    // show content
    showContent(content);
    e.target.value = ''; // clear the input
    if(content != "q"){
      b.reply(content);
    } else {
      // quit the current conversation
      b.say("I suppose we can change topics. Let's talk about something else.");
      b.endConvo();
    };
  }
}



(function(){
  b = new bot();
  b.say(`Hey! I'm the bot behind this chatblog. This is just an experiment
  Jordan's been thinking about, since conversational UI's are en vogue at the moment. Mainly,
  Jordan wanted to see if blogs could be conversational, and what a markup language for creating
  bots might look like. You can ask about his recent projects and his latest thought. You can also
  ask for more info on the chatblog. To quit a conversation loop, just enter: 'q'. If you need help, enter: '?'`);
  get("http://jkhall.me/chatblog/compiled.json", function(d){
    // console.log(JSON.stringify(d));
    // now we have the data
    var conversations = d.map(function(c){
      var newConv = {};
      var trigger = c.convTrigger.join("|");
      // console.log(trigger);
      newConv.trigger = new RegExp(trigger);
      var questions = c.questions.reduce(function(assoc, curVal){
        assoc[curVal.address] = {
          output: curVal.output,
          default: curVal.default
        };
        if(curVal.replies){
          assoc[curVal.address].replies = curVal.replies.map(function(r){
            // have to compile yes no utterances
            var reg = new RegExp(r.cphrases.join("|"));
            return [reg, r.destination, r.response];
          })
        }
        return assoc;
      }, {});
      newConv.questions = questions;
      return newConv;
    });
    convos = convos.concat(conversations);
    console.log(JSON.stringify(convos));
  });
})();
