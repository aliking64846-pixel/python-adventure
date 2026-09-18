async function putPlayer(payload){return apiRequest('/player',{method:'PUT',body:JSON.stringify(payload)})}
async function putGameState(payload){return apiRequest('/game-state',{method:'PUT',body:JSON.stringify(payload)})}
async function putByte(payload){return apiRequest('/byte',{method:'PUT',body:JSON.stringify(payload)})}
async function putLab(payload){return apiRequest('/lab',{method:'PUT',body:JSON.stringify(payload)})}
