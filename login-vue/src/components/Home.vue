<template>
  <div id="all">
      <div id="box">
          <div id="header">
              <router-link to="/home/login">Login</router-link>
              |
              <router-link to="/home/register">Register</router-link>
          </div>
          <div id="footer">
              <router-view></router-view>
          </div>
      </div>
  </div>
</template>

<script>

export default {}
</script>

<style>
* {
    padding: 0;
    margin: 0;
}
#all {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
}

#box {
    height: 35vh;
    width: 20vw;
    border: .2vh solid gray;
    /* background-color: rgb(139, 129, 129); */
    border-radius: 5%;
}

#header {
    height: 20%;
    width: 100%;
    /* background-color: orange; */
    border-bottom: 0.2vh solid gray;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

#footer {
    height: 80%;
    width: 100%;
    display: flex;
    justify-content: center;
    /* align-items: center; */
}

</style>