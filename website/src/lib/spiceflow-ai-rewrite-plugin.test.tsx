import { createSpiceflowClient } from 'spiceflow/client'
import { expect, test } from 'vitest'
import { llmPluginApp } from './spiceflow-ai-rewrite-plugin'
import { rewriteXmlContentForTests, xmlToOldTextTree } from 'plugin-mcp'
import { isTruthy } from './utils'

test(
    'airewrite can generate',
    async () => {
        const orgId = Promise.resolve('7847647d-33a4-466a-8e56-0f03b2dc8ce5')
        const userId = Promise.resolve('7847647d-33a4-466a-8e56-0f03b2dc8ce5')
        const client = createSpiceflowClient(llmPluginApp, {
            state: { orgId, userId },
        })
        const xml = `
    <AI_Kit_Nav>
   	<Navigation>
    		<Stack>
   			<AI_Kit_Navigation_Nav_Top_Item nodeId="w2keh4di">
    				Features
   			</AI_Kit_Navigation_Nav_Top_Item>
   			<AI_Kit_Navigation_Nav_Top_Item nodeId="f9jqiq3c">
    				Developers
   			</AI_Kit_Navigation_Nav_Top_Item>
   			<AI_Kit_Navigation_Nav_Top_Item href="example.com/brand" nodeId="ttyq47m7">
    				Brand
   			</AI_Kit_Navigation_Nav_Top_Item>
   			<AI_Kit_Navigation_Nav_Top_Item href="example.com/blog" nodeId="5mjfkk9h">
    				Blog
   			</AI_Kit_Navigation_Nav_Top_Item>
   			<AI_Kit_Navigation_Nav_Top_Item nodeId="phn7sz8d">
    				Contact
   			</AI_Kit_Navigation_Nav_Top_Item>
    		</Stack>
    		<Stack>
   			<AI_Kit_Button nodeId="koeyy0nt">
    				Sign up for free
   			</AI_Kit_Button>
    		</Stack>
     	</Navigation>
    </AI_Kit_Nav>

    `
        const tree = xmlToOldTextTree(xml)
        const res = await client.llm.generate.post({
            description: 'convert text to french',
            randomId: 'x',
            projectId:
                'f667fc580d8d9346cf49d633d75940b95292fa43c24dd7765c9a175ec73f7405',
            projectName: 'test',

            tree,
        })
        expect(res.error).toBeNull()
        const newContent = await Array.fromAsync(res.data || [])
        expect(newContent.length).not.toBe(0)
        expect(
            rewriteXmlContentForTests({
                xml,
                newContent: newContent
                    .map((x) => {
                        if (x.type === 'fullItem') {
                            return {
                                nodeId: x.nodeId,
                                newContent: x.fullItem.newContent,
                            }
                        }
                    })
                    .filter(isTruthy),
            }),
        ).toMatchInlineSnapshot(`
          "
              <AI_Kit_Nav>
             	<Navigation>
              		<Stack>
             			<AI_Kit_Navigation_Nav_Top_Item nodeId="w2keh4di">
              				Fonctionnalités
             			</AI_Kit_Navigation_Nav_Top_Item>
             			<AI_Kit_Navigation_Nav_Top_Item nodeId="f9jqiq3c">
              				Développeurs
             			</AI_Kit_Navigation_Nav_Top_Item>
             			<AI_Kit_Navigation_Nav_Top_Item href="example.com/brand" nodeId="ttyq47m7">
              				Marque
             			</AI_Kit_Navigation_Nav_Top_Item>
             			<AI_Kit_Navigation_Nav_Top_Item href="example.com/blog" nodeId="5mjfkk9h">
              				Blog
             			</AI_Kit_Navigation_Nav_Top_Item>
             			<AI_Kit_Navigation_Nav_Top_Item nodeId="phn7sz8d">
              				Contact
             			</AI_Kit_Navigation_Nav_Top_Item>
              		</Stack>
              		<Stack>
             			<AI_Kit_Button nodeId="koeyy0nt">
              				Inscrivez-vous gratuitement
             			</AI_Kit_Button>
              		</Stack>
               	</Navigation>
              </AI_Kit_Nav>

              "
        `)
    },
    1000 * 20,
)
