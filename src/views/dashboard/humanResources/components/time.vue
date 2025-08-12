<template>
  <div class="datetime">
    <h2>{{ currentDate }}</h2>
    <h3>{{ currentDay }}</h3>
    <h1>{{ currentTime }}</h1>
  </div>
</template>

<script>
export default {
  name: 'DateTime',
  data() {
    return {
      currentDate: '',
      currentDay: '',
      currentTime: '',
    }
  },
  mounted() {
    console.log('mounted')
    this.updateDateTime()
  },
  methods: {
    updateDateTime() {
      setInterval(() => {
        const now = new Date()
        this.currentDate = this.formatDate(now)
        this.currentDay = this.getDayOfWeek(now)
        this.currentTime = this.formatTime(now)
      }, 1000)
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = this.padZero(date.getMonth() + 1)
      const day = this.padZero(date.getDate())
      return `${year}年${month}月${day}日`
    },
    getDayOfWeek(date) {
      const days = [
        '星期日',
        '星期一',
        '星期二',
        '星期三',
        '星期四',
        '星期五',
        '星期六',
      ]
      return days[date.getDay()]
    },
    formatTime(date) {
      const hours = this.padZero(date.getHours())
      const minutes = this.padZero(date.getMinutes())
      const seconds = this.padZero(date.getSeconds())
      return `${hours}:${minutes}:${seconds}`
    },
    padZero(num) {
      return num < 10 ? `0${num}` : num
    },
  },
}
</script>

<style scoped>
.datetime {
  color: #acc9e5;
  text-align: center;
  display: flex;
  align-items: baseline;
}

.datetime h2 {
  font-size: 24px;
}

.datetime h3 {
  font-size: 22px;
  margin: 0px 35px 0px 21px;
}

.datetime h1 {
  font-size: 36px;
}
</style>
