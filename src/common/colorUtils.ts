export default {
  methods: {
    getRandomColor() {
      let letters = "0123456789ABCDEF";
      let color = "#";

      Array.from({ length: 6 }, () => {
        color += letters[Math.floor(Math.random() * 16)];
      });

      return color;
    },
  },
};
