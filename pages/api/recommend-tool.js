import { getAllTools } from '@/lib/airtable/tools';
import { generateToolRecommendation } from '@/lib/models/providers';

/**
 * Filters tools based on user criteria
 * @param {Array} tools - All available tools
 * @param {string} userGoals - User's primary goal
 * @param {string} experienceLevel - User's experience level
 * @param {Array} priorities - User's priorities
 * @param {Array} requiredFeatures - Features the user requires
 * @returns {Array} - Filtered tools that match user criteria
 */
function filterToolsByUserCriteria(tools, userGoals, experienceLevel, priorities, requiredFeatures) {
  // Start with all tools
  let filteredTools = [...tools];
  
  // Filter by goals if specified
  if (userGoals) {
    // Map goals to relevant categories
    const goalCategoryMap = {
      'content': ['Content Creation', 'Writing', 'Marketing'],
      'research': ['Research', 'Data Analysis', 'Academic'],
      'coding': ['Development', 'Programming', 'No Code Developers'],
      'design': ['Design', 'Art and Design', 'UX/UI'],
      'productivity': ['Productivity', 'Project Management', 'Automation']
    };
    
    const relevantCategories = goalCategoryMap[userGoals] || [];
    
    if (relevantCategories.length > 0) {
      filteredTools = filteredTools.filter(tool => {
        // Check if tool has categories that match the relevant categories
        if (!tool.Categories || !Array.isArray(tool.Categories)) return false;
        
        return tool.Categories.some(category => 
          relevantCategories.some(relevantCat => 
            typeof category === 'string' 
              ? category.includes(relevantCat) 
              : category.Name?.includes(relevantCat)
          )
        );
      });
    }
  }
  
  // Filter by required features if specified
  if (requiredFeatures && requiredFeatures.length > 0) {
    filteredTools = filteredTools.filter(tool => {
      // If tool has no features, it doesn't match
      if (!tool.Features || !Array.isArray(tool.Features) || tool.Features.length === 0) {
        return false;
      }
      
      // Check if tool has all required features
      // This is a simple text matching approach - could be improved with more sophisticated matching
      return requiredFeatures.every(requiredFeature => {
        const lowerRequiredFeature = requiredFeature.toLowerCase();
        return tool.Features.some(feature => 
          feature.toLowerCase().includes(lowerRequiredFeature)
        );
      });
    });
  }
  
  // Apply experience level filtering
  if (experienceLevel) {
    // For beginners, prioritize tools with simpler interfaces and fewer cautions
    if (experienceLevel === 'beginner') {
      filteredTools = filteredTools.filter(tool => {
        // Fewer cautions generally means easier to use
        const cautionCount = tool.Cautions?.length || 0;
        return cautionCount <= 2;
      });
    }
    
    // For advanced users, include more complex tools
    // No additional filtering needed as they can handle any tool
  }
  
  // If we have too few results after filtering, return more tools
  if (filteredTools.length < 3) {
    // Return at least some tools, sorted by relevance to goals
    return tools.slice(0, 10);
  }
  
  // Limit to a reasonable number of tools for the AI to analyze
  return filteredTools.slice(0, 10);
}

/**
 * API handler for tool recommendations
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Extract user criteria from request body
    const { userGoals, experienceLevel, priorities, requiredFeatures } = req.body;
    
    // Validate required fields
    if (!userGoals) {
      return res.status(400).json({ error: 'User goals are required' });
    }
    
    // Get all tools from Airtable
    const allTools = await getAllTools();
    
    // Filter tools based on user criteria
    const filteredTools = filterToolsByUserCriteria(
      allTools, 
      userGoals, 
      experienceLevel, 
      priorities || [], 
      requiredFeatures || []
    );
    
    // If no tools match the criteria, return an appropriate response
    if (filteredTools.length === 0) {
      return res.status(404).json({ 
        error: 'No tools found matching your criteria',
        recommendation: {
          recommendedTool: null,
          reasons: ['No tools found that match your specific requirements'],
          limitations: ['Try broadening your search criteria'],
          alternatives: []
        }
      });
    }
    
    // Use AI to get personalized recommendation
    const recommendation = await generateToolRecommendation(
      userGoals,
      experienceLevel,
      priorities || [],
      requiredFeatures || [],
      filteredTools,
      process.env.OPENROUTER_DEFAULT_MODEL || 'google/gemini-2.5-flash'
    );
    
    // Return the recommendation
    return res.status(200).json(recommendation);
  } catch (error) {
    console.error('[recommend-tool] Error generating recommendation:', error);
    
    // Return a helpful error message
    return res.status(500).json({ 
      error: 'Failed to generate recommendation',
      message: error.message
    });
  }
}
