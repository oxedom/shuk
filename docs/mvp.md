
Shuk - Minimum Viable Product (MVP)

## Project Overview
Shuk is an e-commerce platform connecting consumers with local stores, allowing stores to create online profiles and showcase their products.

## User Types
1. **Consumers** (Unauthenticated Users)
   - Can browse stores and products
   - Can search stores and products
   - Cannot make purchases in MVP version

2. **Store Owners** (Authenticated Users)
   - Can sign up and log in using Google authentication
   - Can create and manage store profile
   - Can add and manage products

## Technical Stack
- **Frontend**: Next.js
- **Styling**: Tailwind CSS
- **Backend**: 
  - Language: TypeScript
  - ORM: Sequelize
  - Database: PostgreSQL

## Features

### Authentication
- Google Sign-Up/Sign-In for Store Owners
- Basic authentication flow

### Store Profile (Store Management Page)
- Upload store logo
- Choose primary/secondary color (from predefined palette)
- Upload cover photo
- Store name
- Contact Information:
  - Phone number
  - WhatsApp link
  - Instagram link
  - Facebook link
  - YouTube link

### Product Management
- Add products with the following attributes:
  - Product name (English)
  - Product name (Hebrew)
  - Price (in shekels or dollars)
  - Description
  - Product image upload

### Store and Product Listing
- Homepage (`/`) with search functionality
  - Search stores by:
    - Name
    - Tags
    - Text

- Store Profile Page (`/[username]`)
  - Display store information
  - Product grid layout:
    - Desktop: 3x3 grid
    - Mobile: 1x1 grid
  - "Add to Cart" button (non-functional in MVP)

### Routing
- `/` - Homepage with store search
- `/[username]` - Individual store profile
- `/[username]/shop/[product-id]` - Potential future route for individual product pages

## MVP Limitations
- No actual e-commerce functionality
- No cart or checkout process
- Limited color and styling options
- Basic search functionality

## Future Considerations
- Implement full e-commerce capabilities
- Enhanced search and filtering
- More customization options for stores
- Mobile responsiveness improvements

## Technical Considerations
- Implement robust error handling
- Ensure responsive design
- Secure Google authentication
- Optimize database queries
- Implement basic input validation

## Success Metrics
- Number of stores signed up
- User engagement with store profiles
- Search functionality usage

## Development Milestones
1. Set up project infrastructure
2. Implement authentication
3. Create store profile management
4. Develop product management
5. Implement homepage and search
6. Testing and initial deployment