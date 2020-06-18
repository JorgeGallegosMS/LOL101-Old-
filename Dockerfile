# Get the base Node image
FROM node:10

# Create app directory
WORKDIR /app

# Copy dependencies
COPY package*.json /app/

# Install dependencies
RUN npm install

# Bundle app source
COPY . /app

# Expose the port for Node
EXPOSE 3000

# Run the server
CMD ["npm", "start"]
