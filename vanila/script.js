import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
// get the form and chatContainer
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// function to load our messages, start with (...) + -
function loader(e) {
  e.textContent = "";
  loadInterval = setInterval(() => {
    e.textContent += ".";
    console.log(e.textContent);
    if (e.textContent === "....") {
      // if loading indicator reached ... then reset it
      e.textContent = "";
    }
  }, 300);
}
// function to print response one letter by letter.
function typeText(e, text) {
  
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      e.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// we have to generate unique id for every response to map over them.
function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hedaDecimal = randomNumber.toString(16);

  return `id-${timestamp}-${hedaDecimal}`;
}

// for each question and respnse there are different icon and color

function chatStripe(isAi, value, uniqueId) {
  return `<div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"  
            alt="${isAi ? "bot" : "user"}"  
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `;
}

// function to submuit which will trigger the ai
const handelSubmit = async (e) => {
  e.preventDefault();
  // to get the data which we typed in the form
  const data = new FormData(form);
  console.log(data);

  // users chatstripe
  chatContainer.innerHTML += chatStripe(
    false,
    data.get("prompt"),
    generateUniqueID()
  );
  console.log(chatContainer.innerHTML);
  form.reset();
  // bots chatstripe
  const uniqueId = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  // scroll down on users type
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  console.log(messageDiv);
  loader(messageDiv);

  // fetch data from server -> bot's response

  const response = await fetch('http://localhost:5000',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parseData= data.bot.trim();
    console.log(parseData);
    typeText(messageDiv, parseData);
  }
  else {
   const err = await response.text();
   messageDiv.innerHTML = "Something Went Wrong";
   alert(err);
  }
};

form.addEventListener("submit", handelSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handelSubmit(e);
  }
});
