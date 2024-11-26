// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import prisma from "../../../../utils/db";
import { authMiddleware } from '../../../../utils/middleware';

async function handler(req, res) {
    if (req.method === 'POST') {
        const { templateId } = req.body;
        const { user } = req; // User info from authMiddleware

        if (templateId === undefined || templateId === '') {
            console.log(templateId);
            return res.status(400).json({ "error": "Template ID is required" });
        }

        let template;

        try {
            template = await prisma.template.findUniqueOrThrow({
                where: {
                    id: parseInt(templateId)
                }, 
                include: {
                    tags: true,
                }
            });
        } catch (error) {
            // console.error(error);
            return res.status(404).json({ error: 'Failed to find template' });
        }

        try {
            const new_template = await prisma.template.create({
                data: {
                    title: template.title,
                    explaination: template.explaination,
                    fileContent: template.fileContent,
                    userId: user.userId, // Associate template with the logged-in user
                    isForked: true,
                    forkedFromId: template.id,
                    tags: {
                        connectOrCreate: template.tags.map(tag => ({
                            where: { name: tag.name }, // Check if the tag exists
                            create: { name: tag.name }, // Create tag if it doesn't exist
                        }))
                    },
                }
            });
            return res.status(201).json({ "message": "Template forked", "templateId": new_template.id });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Template found, but fork failed' });
        }
    }
}

export default authMiddleware(handler);  // Protect the route with authMiddleware