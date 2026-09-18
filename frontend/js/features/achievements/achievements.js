function renderAchievements(){$('achievementList').innerHTML=achievements.map(a=>`<div class="info-box">${a[3]?'🏅':'🔒'} <strong>${a[1]}</strong><br>${a[2]}</div>`).join('')}
